import {
    accountConstants,
    makeActionCreator
  } from "./ActionTypes";
  
  import { AccountService } from "./AccountServiceActions";
  
  function GetRoleList(call) {
    return function(dispatch) {
      AccountService
        .GetRoleList({},function(data){
            dispatch(makeActionCreator(accountConstants.ROLE_LIST,"roleList")(data));
            if(call&&typeof call==='function'){
              call(data);
            }
        })
    };
  }

  export const AccountActions = {GetRoleList};
  