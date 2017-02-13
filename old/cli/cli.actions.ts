import { CliState } from './cli'

export interface IssueCommandAction {
  type: string,
  payload: CliState<any, any>
}
export const IssueCommandActionType = Symbol('ISSUE_COMMAND')
export function createIssueCommandAction(commandChain: string[], args, options): IssueCommandAction {
  return {
    type: 'ISSUE_COMMAND',
    payload: {
      commandChain: commandChain.join(' '),
      args,
      options
    }
  }
}
export function isIssueCommandAction(action: any): action is IssueCommandAction {
  return action.type === IssueCommandActionType
}
