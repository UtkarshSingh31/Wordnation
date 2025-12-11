from app.services.llm.provider import model
from app.services.llm.prompts import final_prompt
from app.services.llm.chains import parser,word_meaning_chain,example_chain

final_chain=(
    word_meaning_chain|
    example_chain |
    final_prompt|
    model|
    parser
)

def get_result(word:str)->str:
    result=final_chain.invoke({'word':word})
    return result

def main():
    word=input("Enter a word: ")
    response=get_result(word=word)
    print(response)

if __name__=="__main__":
    main()