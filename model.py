import streamlit as st
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough,RunnableParallel

load_dotenv()

model=ChatGoogleGenerativeAI(model='gemini-2.5-flash')

prompt1 = ChatPromptTemplate.from_template("""
You are a vocabulary explainer who speaks in simple A2–B1 English.
Explain the word below in the easiest, friendliest way possible.

TASKS:
1. Give a simple meaning (1–2 lines).
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
1. Give 3–5 simple example sentences.
2. Give 3–6 real synonyms that match this meaning only.
3. Ignore all other meanings.

FORMAT:
Examples:
1. ...
2. ...
3. ...

Synonyms:
- ...
- ...
""")

parser=StrOutputParser()

word_meaning_chain= prompt1 | model | parser

example_chain=RunnableParallel({
    'word_meaning': RunnablePassthrough(),
    'examples': prompt2 | model | parser
})

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
- 2–3 of the example sentences (the best ones),
- a short list of the most useful synonyms,
- an optional memory trick if helpful.

Tone: friendly, simple English (A2–B1 level).

FINAL EXPLANATION:
""")


final_chain=(
    word_meaning_chain|
    example_chain |
    final_prompt|
    model|
    StrOutputParser()
)

st.title("📘 Vocabulary Explainer — AI Powered")
st.write("Enter a word below and let the AI teach it to you in simple English!")

word = st.text_input("Enter a word:", "")

if st.button("Explain"):
    if not word.strip():
        st.warning("Please enter a word.")
    else:
        with st.spinner("Thinking..."):
            result= final_chain.invoke({'word':word})
        
        st.markdown("Explantion: ")
        st.write(result)