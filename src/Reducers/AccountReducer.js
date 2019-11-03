import {
    accountConstants
} from '../Actions/ActionTypes'

//初始化参数
function AccountReducer(state = {
    roleList: []
}, action) {
    switch (action.type) {
        case accountConstants.ROLE_LIST:
            return { ...state, roleList: action.roleList };
        default:
            return state;
    }
}
export default AccountReducer;
