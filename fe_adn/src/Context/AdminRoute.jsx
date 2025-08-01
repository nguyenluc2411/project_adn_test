import PrivateRouter from "./PrivateRouter.jsx";

const AdminRoute = ({ children }) => {
  return (
    <PrivateRouter allowedRole="ADMIN">
      {children}
    </PrivateRouter>
  );
};

export default AdminRoute;
