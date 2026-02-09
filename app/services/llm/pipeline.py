from services.llm.provider import model
from services.llm.prompts import final_prompt
from services.llm.chains import word_meaning_chain,example_chain,parser1

final_chain=(
    word_meaning_chain|
    example_chain |
    final_prompt|
    model|
    parser1
)

def get_result(word:str)->str:
    result=final_chain.invoke({'word':word})
    return result

def main():
    word=input("Enter a word: ")
    response=get_result(word=word)

if __name__=="__main__":
    main()