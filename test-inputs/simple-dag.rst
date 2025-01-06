.. parsonsprob:: simple_dag
    :grader: dag

    -----
    a = 5 #tag:0; depends:;
    =====
    b = 10 #tag:1; depends:;
    =====
    result = a * b #tag:2; depends: 0,1;
    =====
    print(f"result = {result}") #tag:3; depends: 2;