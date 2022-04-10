class BasicCharacterController {
    constructor() {
        this._input = new  BasicCharacterControllerInput();
        this._stateMachine = new FiniteStateMachine();


    }
};

class BasicCharacterControllerInput {
    constructor() {

    }
};

class FiniteStateMachine {
    constructor() {
        this._states = {};
        this._currentState = null;
    }

    _AddState(name, type) {
        this._states[name] = type;
    }

    SetState(name) {
        const prevState = this._currentState;

        if (prevState) {
            if(prevState.Name == name) {
                return;
            }
            prevState.Exit();
        }

        const state = new this._states[names](this);
        this._currentState = state;
        state.Enter(prevState);
    }

    Update(timeElapsed, input) {
        if (this._currentState) {
            this._currentState.Update(timeElapsed, input);
        }
    }
};

class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
        super();
        this._proxy = proxy;
        this._Init();
    }

    _Init() {
        this._AddState('run', RunState);
    }
};



