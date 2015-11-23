/**
 * Created by gaoquan on 2015/10/10.
 */
var GetItemAt = function(arr, index, content){
    return content.fn(arr[index]);
}
module.exports = {
    GetItemAt:GetItemAt
}