import Notification from "../models/notificaion.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user._id,
    }).populate({
      path: "sender",
      select: "userName profileImage",
    });

    await Notification.updateMany({ receiver: req.user._id }, { isRead: true });
    return res.status(200).json(notifications);
  } catch (error) {
    console.error(`Error while getting notifications ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ receiver: req.user._id });
        return res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        console.error(`Error while deleting notifications ${error.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// export const deleteNotification = async (req, res) => {
//     try {
//         const notificaion = await Notification.findById(req.params.id);
//         if (!notificaion) {
//             return res.status(404).json({ error: "Notification not found" });
//         }

//         if(notificaion.receiver.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ error: "You are not authorized to delete this notification" });
//         }

//         await Notification.findByIdAndDelete(req.params.id);
//         return res.status(200).json({ message: "Notification deleted successfully" });
//     } catch (error) {
//         console.error(`Error while deleting notification ${error.message}`);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// }