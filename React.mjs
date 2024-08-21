let currentHook = 0;
let hooks = [];

// 호출 순서
const useState = (initialValue) => {
    hooks[currentHook] = hooks[currentHook] || initialValue; //hook을 배열로 관리함
    const hookIndex = currentHook; //hook배열의 인덱스값
    const setState = (newState) => {
        if (typeof newState === "function") {
            //useState내부에서 함수형태로 작성할 때 prev => prev + 1
            hooks[hookIndex] = newState(hooks[hookIndex]); //기존 저장된 값을 해당 함수에 넣는다. 1 => 1 + 1
        } else {
            hooks[hookIndex] = newState; //새로운 값으로 state를 저장한다. setState(count + 1)
        }
    };
    //hook배열에서 다음 hook을 실행하기위해 currentHook에 1을 더한 값과 해당 state를 바꾸는 setState를 리턴함
    return [hooks[currentHook++], setState];
};

const useEffect = (callback, depArray) => {
    const hasNoDeps = !depArray; //의존성 배열이 있는지에 대한 boolean값, 없다면 true가 되도록
    //이전 의존성 배열과 비교하기 위한 prevDeps
    const prevDeps = hooks[currentHook] ? hooks[currentHook].deps : undefined; //현재 useEffect가 hooks에 존재한다면 기존의 useEffect의 deps를 이전 의존성배열로, 없다면 undefined
    // cleanUp가 있으면 이전 cleanUp함수로, 없다면 동일하게 undefined로
    const prevCleanUp = hooks[currentHook] ? hooks[currentHook].cleanUp : undefined;

    //의존성 배열속 값에 변화가 있는지 체크
    const hasChangedDeps = prevDeps ? !depArray.every((el, i) => el === prevDeps[i]) : true;
    //의존성 배열의 각 요소와 이전 의존성배열의 각 요소가 모두 일치한다면 !true >> false
    //prevDeps가 없다면 의존성 배열의 변화도 없으므로 true

    //의존성 배열이 없거나, 의존성 배열에 변화가 있다면 다음 명령 실행
    if (hasNoDeps || hasChangedDeps) {
        if (prevCleanUp) prevCleanUp(); //cleanUp함수가 있으면 실행
        const cleanUp = callback(); //cleanUp함수는 콜백함수의 리턴값이므로 callback()으로 리턴값을 넣어준다.
        hooks[currentHook] = { deps: depArray, cleanUp }; //해당 useEffect hook위치에 변화된 의존성배열과 cleanUp함수를 다시 넣어준다.
    }
    currentHook++; //다음 hook을 실행하도록 hookIndex값을 올려줌
};

const MyReact = {
    render(Component) {
        const instance = Component();
        instance.render();
        currentHook = 0;
        return instance;
    },
};

MyReact.useState = useState;
MyReact.useEffect = useEffect;

export { useState, useEffect };
export default MyReact;
