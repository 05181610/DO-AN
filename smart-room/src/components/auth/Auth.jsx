import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { CONSTANTS } from "../../utils/constants";

function Auth() {
    const isLogin = localStorage.getItem(CONSTANTS.NAME_TOKEN) !== null;
    return isLogin ? <Outlet /> : <Navigate to={CONSTANTS.PATH.LOGIN_PATH} />;
}

export default Auth;
