from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import List, Dict, Tuple
import logging
import re

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

client = AsyncOpenAI(api_key=settings.openai_api_key)


QA_SYSTEM_PROMPT = """You are a helpful, knowledgeable assistant that answers questions based on the user's documents. You communicate in a natural, conversational tone while being accurate and informative.

## How to Respond

**Be Natural**: Write like you're having a conversation. Avoid robotic or overly formal language. Use "I found that..." or "Based on the documents..." naturally.

**Be Accurate**: Only use information from the provided document context. If something isn't in the documents, say so honestly.

**Be Clear**: Give direct answers first, then provide supporting details. Don't bury the answer in lengthy explanations.

**Be Helpful**: If you can't find exactly what they asked, mention related information that might be useful.

## Formatting Guidelines

Keep formatting simple and readable:
- Use **bold** sparingly for key numbers, terms, or important points
- Use bullet points when listing multiple items
- Use short paragraphs (2-3 sentences)
- Only use headers (##) for longer, multi-part answers
- Quote directly from documents when it adds value

## Examples of Good Responses

**Simple question**: "The project budget is **$1.2 million**, allocated across three phases. Most of the funding (50%) goes to development, with the remainder split between testing and deployment."

**Complex question**: "Based on the documents, there are three main risk factors to consider:

- **Timeline risk**: The Q4 deadline is aggressive given the current progress
- **Resource constraints**: The team is currently understaffed by 2 engineers
- **Technical debt**: Legacy system integration may cause delays

The status report recommends addressing the staffing issue first."

**When information isn't found**: "I couldn't find specific pricing information in these documents. However, I did find details about the payment terms and contract structure if that would be helpful."

## Important Rules
1. ONLY use information from the provided context
2. Be honest when you can't find something
3. Cite the document name when referencing specific facts
4. Keep responses focused and concise"""


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
)
async def generate_answer(question: str, context: str) -> Tuple[str, str]:
    """
    Generate an answer to a question based on context.

    Returns:
        Tuple of (answer, confidence)
    """
    messages = [
        {"role": "system", "content": QA_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Here's the context from the user's documents:

{context}

---

User's question: {question}

Please answer naturally and conversationally, using only the information from the documents above. If the answer isn't in the documents, let me know.""",
        },
    ]

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=messages,
        temperature=0.3,  # Slightly higher for more natural responses
        max_tokens=1500,
    )

    answer = response.choices[0].message.content

    # Determine confidence based on response
    confidence = "high"
    low_confidence_phrases = [
        "i couldn't find",
        "not mentioned",
        "no information",
        "cannot determine",
        "unclear",
        "not sure",
        "might be",
        "possibly",
    ]
    if any(phrase in answer.lower() for phrase in low_confidence_phrases):
        confidence = "low"
    elif any(phrase in answer.lower() for phrase in ["may", "could", "appears"]):
        confidence = "medium"

    return answer, confidence


DRAFT_SYSTEM_PROMPT = """You are an expert professional document writer specializing in creating polished, compelling business documents. You craft content that is clear, persuasive, and tailored to the target audience.

## Your Expertise
- Business proposals and pitches
- Contracts and agreements
- Reports and analysis documents
- Executive summaries and briefs
- Professional correspondence

## Core Principles

### 1. Structure & Organization
- Follow the requested section structure exactly
- Use clear hierarchy: # for title, ## for main sections, ### for subsections
- Create logical flow between sections
- Include smooth transitions

### 2. Content Quality
- Write clear, concise, and impactful prose
- Use active voice and strong verbs
- Include specific details, numbers, and data points where available
- Avoid jargon unless appropriate for the audience

### 3. Grounding in References
- Draw content, style, and tone from the reference documents
- Use similar terminology and phrasing patterns
- Match the professionalism level of the references
- NEVER invent facts, figures, or claims not supported by references

### 4. Professional Formatting
- Use **bold** for key terms and important points
- Use bullet points for lists of benefits, features, or items
- Use numbered lists for sequential steps or priorities
- Use tables for comparative data when helpful
- Include clear calls-to-action where appropriate

## Document Types Best Practices

### Proposals
- Lead with value proposition
- Clearly state the problem and solution
- Include specific deliverables and timelines
- End with clear next steps

### Contracts
- Use precise, unambiguous language
- Define all key terms
- Include all necessary clauses
- Structure for easy navigation

### Reports
- Start with executive summary
- Present data clearly with context
- Include analysis and insights
- End with recommendations

### Status Updates
- Lead with overall status
- Highlight key accomplishments
- Be transparent about risks/issues
- Clearly state next steps"""


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
)
async def generate_draft(
    instruction: str,
    reference_excerpts: List[Dict],
    sections: List[str],
    style_guidance: str = None,
) -> Tuple[str, List[Dict]]:
    """
    Generate a document draft based on instructions and reference documents.

    Returns:
        Tuple of (full_draft, parsed_sections)
    """
    # Build reference context
    reference_context = ""
    for ref in reference_excerpts:
        reference_context += f"\n\n### Reference: {ref['file_name']}\n"
        for excerpt in ref["excerpts"]:
            reference_context += f"\n{excerpt}\n"

    sections_str = "\n".join([f"- {s}" for s in sections])

    style_note = ""
    if style_guidance:
        style_note = f"\n\nSTYLE GUIDANCE:\n{style_guidance}"

    messages = [
        {"role": "system", "content": DRAFT_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Create a professional document based on the specifications below.

---
## Document Request
{instruction}

---
## Required Sections
Generate content for each of these sections:
{sections_str}

---
## Reference Materials
Use these excerpts to inform your writing style, tone, terminology, and content approach:
{reference_context}
{style_note}

---
## Output Requirements

1. **Title**: Start with a clear, professional title using # heading
2. **Sections**: Include ALL required sections using ## headings
3. **Content**:
   - Write compelling, professional prose
   - Use specific details and data from references where available
   - Maintain consistent tone throughout
   - Include bullet points and formatting for readability
4. **Length**: Each section should be substantive (3-6 paragraphs or equivalent)
5. **Quality**: The document should be ready for professional use with minimal editing

Generate the complete document now:""",
        },
    ]

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=messages,
        temperature=0.4,  # Balanced creativity and consistency
        max_tokens=4000,  # Increased for comprehensive documents
    )

    draft = response.choices[0].message.content

    # Parse sections from the draft
    parsed_sections = parse_markdown_sections(draft)

    return draft, parsed_sections


def parse_markdown_sections(markdown: str) -> List[Dict]:
    """Parse markdown into sections based on ## headers."""
    sections = []
    current_section = None
    current_content = []

    lines = markdown.split("\n")

    for line in lines:
        if line.startswith("## "):
            # Save previous section
            if current_section:
                sections.append({
                    "title": current_section,
                    "content": "\n".join(current_content).strip(),
                })

            current_section = line[3:].strip()
            current_content = []
        elif current_section:
            current_content.append(line)

    # Save last section
    if current_section:
        sections.append({
            "title": current_section,
            "content": "\n".join(current_content).strip(),
        })

    return sections
