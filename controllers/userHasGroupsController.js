const {
    register_User_has_Group,
    find_Users_of_Group,
    find_Groups_of_User,
    patch_Users_Has_Groups,
    find_Activity_of_Group,
    findAdminIs,
    delete_User_has_Group,
    change_Admin_Has_Group,
    finally_Find_Users,
    admin_Find_Users,
    finally_Del_Activ_Of_Groups
} = require("@services/userHasGroupServices");
const { finally_Find_Groups } = require("../services/userHasGroupServices");

const { getUserWithEmail } = require("@services/userService")

const postUsers_Group = async (req, res) => {
    try {
        // console.log(req.body)
        const { email } = req.body;
        const idGroup = req.params.id_group;
        const percent = req.body.percent;
        // VER SI EL EMAIL EXISTE EN LA BBDD
        // console.log(email)
        const {dataValues: user} = await getUserWithEmail(email)
        console.log('LOG',user)

        if(!user){
            return res.status(400).json({ error: `User with ${user.email} not exists` });
        }

        // if (!idGroup || !Array.isArray(userIds) || userIds.length === 0) {
        //     return res.status(400).json({ error: "Invalid input data" });
        // }

        const result = await register_User_has_Group(user.id, idGroup, percent);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const getUsers_Of_Group = async (req, res) => {
    try {
        const adminIs = await findAdminIs(req.params.id_group);
        adminIsHere = JSON.parse(adminIs);

        const result = await find_Users_of_Group(req.params.id_group);
        if (result.length > 0) {
            const array_Of_Users = result.map((item) => item.idUser);
            const result_Users = await finally_Find_Users(array_Of_Users);
            const result_Users_Admin = await admin_Find_Users(
                result_Users,
                adminIsHere.idUser,
                req.params.id_group
            );
            const result_final = result_Users_Admin.map(u => {
                const userPercent = result.find(item => item.dataValues.idUser === u.id);
                return {
                    ...u,
                    percent: userPercent ? userPercent.dataValues.percent : null
                };
            });

            res.status(200).json(result_final);
        } else {
            throw new Error("Group without users");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const getGroup_Of_User = async (req, res) => {
    try {
        const result = await find_Groups_of_User(req.params.id_user);
        if (result.length > 0) {
            const array_Of_idGroups = result.map((item) => item.idGroup);
            const result_Groups = await finally_Find_Groups(array_Of_idGroups);
            res.status(200).json(result_Groups);
        } else {
            throw new Error("User without GROUPS");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const change_User_Has_Group = async (req, res) => {
    try {
        const payload = req.body;
        const groupId = req.params.id_group;

        if (
            !groupId ||
            !Array.isArray(payload) ||
            payload.length === 0 
        ) {
            return res.status(400).json({ error: "Invalid input data" });
        }

        const userIds = payload.map(user => user.userId);
        const percents = payload.map(user => user.percent);
        // empiezo el control de admin
        const adminIs = await findAdminIs(groupId);
        adminIsHere = JSON.parse(adminIs);


        const result = await patch_Users_Has_Groups(groupId, userIds, percents);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const getActivity_Of_Group = async (req, res) => {
    try {
        const result = await find_Activity_of_Group(req.params.id_group);
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            throw new Error("Group without ACTIVITIES");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const delete_Users_Of_Group = async (req, res) => {
    try {
        const { usersOut } = req.body;
        const groupId = req.params.id_group;

        if (!groupId || !Array.isArray(usersOut) || usersOut.length === 0) {
            return res.status(400).json({ error: "Invalid input data" });
        }

        const adminIs = await findAdminIs(groupId);
        adminIsHere = JSON.parse(adminIs);

        if (usersOut.includes(adminIsHere.idUser)) {
            return res.status(400).json({ error: "Is an Admin to delete" });
        }

        const result = await delete_User_has_Group(usersOut, groupId);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const change_Admin_Of_Group = async (req, res) => {
    try {
        const { newAdmin, oldAdmin } = req.body;
        const groupId = req.params.id_group;
        console.log("admin a cambiar =>" + oldAdmin);
        console.log("admin a poner => " + newAdmin);
        if (!groupId || !newAdmin || !oldAdmin) {
            return res.status(400).json({ error: "Invalid input data" });
        }

        const adminIs = await findAdminIs(groupId);
        adminIsHere = JSON.parse(adminIs);

        if (adminIsHere.idUser != oldAdmin) {
            return res
                .status(400)
                .json({ error: "Invalid input Admin to change or User not found" });
        }

        const result = await change_Admin_Has_Group(newAdmin, oldAdmin, groupId);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const deleteActivity_Of_Group = async (req, res) => {
    const groupId = req.params.id_group;
    // faltaria controlar que exista el grupo
    // no se por que me rompe la ejecucion el control de que exista
    // y en otros ends anda bien
    if (!groupId) {
      return res.status(400).json({ error: "Invalid input data" });
    }
  
    const result_activities = await find_Activity_of_Group(groupId);
    if (result_activities.length > 0) {
      const result = await finally_Del_Activ_Of_Groups(groupId);
      res.status(200).json({ ok: "Activities deleted" });
    } else {
      res.status(404).json({ error: "Group without activities" });
    }
  };

module.exports = {
    postUsers_Group,
    getUsers_Of_Group,
    getGroup_Of_User,
    change_User_Has_Group,
    getActivity_Of_Group,
    delete_Users_Of_Group,
    change_Admin_Of_Group,
    deleteActivity_Of_Group
};