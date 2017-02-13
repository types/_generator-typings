

export class Inquirer {
  ask(questions, statePath: string) {
  }
}
export function ask(questions, statePath: string) {
}

let container
let store
let state

const inquirer = container.get(Inquirer)
inquirer.ask({})
store.dispatch(ask({}, 'config.info'))

state.inquiry = {
  path: 'config.info',
  questions: [{
    name: 'githubUsername',
    message: 'What is your github username?',
    default: 'unional'
  }, {
    name: 'githubOrganization',
    message: 'What is your github org?',
    default: 'unional'
  }]
}

state.ui = {
  type: 'prompt',
  message: 'What is your github username?'
}

state.ui = {
  type: 'response',
  message: ''
}
// how does the validation perform?
state.ui = {
  type: 'prompt',
  message: 'username cannot be empty. Please enter again'
}

state.ui = {
  type: 'response',
  message: 'unional'
}

state = {
  inquiry: {
    path: 'config.info',
    questions: [{
      name: 'githubOrganization',
      message: 'What is your github org?',
      default: 'unional'
    }],
    answers: {
      githubUsername: 'unional'
    }
  }
}

// ...

state = {
  inquiry: {
    path: 'config.info',
    answers: {
      githubUsername: 'unional',
      githubOrganization: 'unional'
    }
  }
}
state = {
  config: {
    info: {
      githubUsername: 'unional',
      githubOrganization: 'unional'
    }
  }
}
