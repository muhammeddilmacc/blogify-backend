import { db } from '../utils/config.js';
export const authorizeByRoleAndPermission = ({ requiredRoles, requiredPermissions, }) => {
    return async (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).send('Unauthorized');
        }
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            return res.status(404).send('User not found');
        }
        const userData = userDoc.data();
        if (!userData) {
            return res.status(404).send('User data not found');
        }
        const userRoles = userData.roles;
        // if user has required role, authorize immediately
        const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));
        if (hasRequiredRole) {
            return next();
        }
        // if user has required permission, authorize immediately
        const rolePermissions = [];
        for (const role of userRoles) {
            const roleDoc = await db.collection('roles').doc(role).get();
            if (roleDoc.exists) {
                const roleData = roleDoc.data();
                rolePermissions.push(...(roleData?.permissions || []));
            }
        }
        // remove duplicates
        const userPermissions = [...new Set(rolePermissions)];
        const hasPermission = requiredPermissions.every((permission) => userPermissions.includes(permission));
        if (!hasPermission) {
            return res.status(403).send('Forbidden');
        }
        next();
    };
};
