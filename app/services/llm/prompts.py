from langchain_core.prompts import ChatPromptTemplate

prompt1 = ChatPromptTemplate.from_template("""
You are a vocabulary explainer who speaks in simple A2 to B1 English.
Explain the word below in the easiest, friendliest way possible.

TASKS:
1. Give a simple meaning (1 to 2 lines).
2. Add a short memory trick (optional).
3. Keep tone friendly and beginner-friendly.

WORD: {word}
""")

prompt2 = ChatPromptTemplate.from_template("""
You are a vocabulary tutor for A2–B1 English learners.

Below is the meaning of a word. Based on this meaning, create examples.

MEANING:
{word_meaning}

TASKS:
1. Give 3 to 5 simple example sentences.
2. Give 3 to 6 real synonyms that match this meaning only.
3. Ignore all other meanings.

FORMAT:
Examples:
1. ...
2. ...
3. ...

Synonyms:
- ...
- ...
"""
)

final_prompt = ChatPromptTemplate.from_template("""
You are a friendly English tutor.

Here is a word explanation and its example sentences:

MEANING:
{word_meaning}

EXAMPLES & SYNONYMS:
{examples}

TASK:
Write one clean final explanation that includes:
- the meaning (rewritten simply),
- 2 to 3 of the example sentences (the best ones),
- a short list of the most useful synonyms,
- an optional memory trick if helpful.

Tone: friendly, simple English (A2 to B1 level).

FINAL EXPLANATION:
""")

