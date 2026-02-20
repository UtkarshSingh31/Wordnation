from .provider import model
from .prompts import prompt1, prompt2, final_prompt
from langchain_core.output_parsers import StrOutputParser,JsonOutputParser
from langchain_core.runnables import RunnablePassthrough,RunnableParallel

parser=StrOutputParser()
parser1=JsonOutputParser()
word_meaning_chain= prompt1 | model | parser

example_chain=RunnableParallel({
    "word": RunnablePassthrough(),
    'word_meaning': RunnablePassthrough(),
    'examples': prompt2 | model | parser
})

