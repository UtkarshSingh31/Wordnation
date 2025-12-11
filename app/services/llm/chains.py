from app.services.llm.provider import model
from app.services.llm.prompts import prompt1,prompt2,final_prompt
from langchain_core.output_parsers import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough,RunnableParallel

parser=StrOutputParser()

word_meaning_chain= prompt1 | model | parser

example_chain=RunnableParallel({
    'word_meaning': RunnablePassthrough(),
    'examples': prompt2 | model | parser
})

