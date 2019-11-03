import Utils from "utils/utils";

function GetRoleList(params,handleResponse) {
    return Utils.request({
        api:'/api/admin/role/list',
        success:function(data){
            handleResponse(data);
        }
    })
}

export const AccountService = { GetRoleList };

