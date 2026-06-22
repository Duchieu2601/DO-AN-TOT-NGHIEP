import * as userService from "../services/user";

export const getCurrent = async (req, res) => {
  const { id } = req.user;
  try {
    const response = await userService.getCurrentService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ err: -1, msg: "Failed: " + error });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.user;
  try {
    const response = await userService.updateUserService(id, req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ err: -1, msg: "Failed: " + error });
  }
};
