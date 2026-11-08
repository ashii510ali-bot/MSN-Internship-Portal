
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const MentorNotification = require("../models/mentor/MentorNotification");
const User = require("../models/User");

const { ROLES } = require("../constants/roles");

// ============================================================
// NORMALIZE ANNOUNCEMENT AUDIENCE
// ============================================================

const normalizeAudience = (audience) => {
  const audienceMap = {
    All: "All",
    Interns: "Interns",
    "All Interns": "Interns",
    Mentors: "Mentors",
    "All Mentors": "Mentors",
    "Project Managers": "Project Managers",
  };

  return audienceMap[audience || "All"] || null;
};

// ============================================================
// GET RECIPIENT ROLES
// ============================================================

const getRecipientRoles = (audience) => {
  switch (audience) {
    case "Interns":
      return [ROLES.INTERN, ROLES.SUPER_ADMIN];

    case "Mentors":
      return [ROLES.MENTOR, ROLES.SUPER_ADMIN];

    case "Project Managers":
      return [ROLES.PROJECT_MANAGER, ROLES.SUPER_ADMIN];

    case "All":
      return [
        ROLES.INTERN,
        ROLES.MENTOR,
        ROLES.PROJECT_MANAGER,
        ROLES.SUPER_ADMIN,
      ];

    default:
      return [];
  }
};

// ============================================================
// SYNC MENTOR ANNOUNCEMENT NOTIFICATIONS
// ============================================================

const syncMentorAnnouncementNotifications = async (
  announcement,
  audience
) => {
  const announcementId = String(announcement._id);

  // Only Mentors and All audiences receive Mentor notifications.
  if (audience !== "Mentors" && audience !== "All") {
    await MentorNotification.deleteMany({
      sourceType: "Announcement",
      sourceId: announcementId,
    });

    return;
  }

  // Get active Mentor accounts only.
  const mentors = await User.find({
    role: ROLES.MENTOR,
    status: "Active",
  }).select("_id");

  const mentorIds = mentors.map((mentor) => mentor._id);

  // Remove notifications for users who are no longer eligible.
  await MentorNotification.deleteMany({
    sourceType: "Announcement",
    sourceId: announcementId,
    recipientId: { $nin: mentorIds },
  });

  if (mentors.length === 0) {
    return;
  }

  // Create or update one notification per Mentor.
  const operations = mentors.map((mentor) => ({
    updateOne: {
      filter: {
        recipientId: mentor._id,
        sourceType: "Announcement",
        sourceId: announcementId,
      },

      update: {
        $set: {
          title: announcement.title,
          message: announcement.description,
          type: "Announcement",
          priority: announcement.priority || "Medium",

          recipientId: mentor._id,

          sourceRole: "Program Manager",
          sourceType: "Announcement",
          sourceId: announcementId,

          relatedId: announcementId,
          relatedName: "Program Announcement",

          createdBy: "Program Manager",
        },

        $setOnInsert: {
          isRead: false,
        },
      },

      upsert: true,
    },
  }));

  await MentorNotification.bulkWrite(operations);
};

// ============================================================
// SYNC GENERAL + MENTOR NOTIFICATIONS
// ============================================================

const syncAnnouncementNotifications = async (announcement) => {
  const announcementId = String(announcement._id);

  // Draft announcements should not generate notifications.
  if (announcement.status !== "Published") {
    await Notification.deleteMany({
      sourceType: "Announcement",
      sourceId: announcementId,
    });

    await MentorNotification.deleteMany({
      sourceType: "Announcement",
      sourceId: announcementId,
    });

    return;
  }

  const audience = normalizeAudience(announcement.audience);

  if (!audience) {
    throw new Error("Invalid announcement audience.");
  }

  const recipientRoles = getRecipientRoles(audience);

  const recipients = await User.find({
    role: { $in: recipientRoles },
    status: "Active",
  }).select("_id role");

  const recipientIds = recipients.map((user) => String(user._id));

  // Remove general notifications for users no longer eligible.
  await Notification.deleteMany({
    sourceType: "Announcement",
    sourceId: announcementId,
    recipientId: { $nin: recipientIds },
  });

  if (recipients.length > 0) {
    const operations = recipients.map((user) => ({
      updateOne: {
        filter: {
          recipientId: String(user._id),
          sourceType: "Announcement",
          sourceId: announcementId,
        },

        update: {
          $set: {
            userId: user._id,
            recipientId: String(user._id),
            recipientRole: user.role,

            title: announcement.title,
            message: announcement.description,
            type: "Announcement",
            priority: announcement.priority || "Medium",

            sourceRole: ROLES.PROGRAM_MANAGER,
            sourceType: "Announcement",
            sourceId: announcementId,

            relatedId: announcementId,
            relatedType: "Announcement",
            relatedName: "Program Announcement",

            createdBy: "Program Manager",
            senderRole: ROLES.PROGRAM_MANAGER,
          },

          $setOnInsert: {
            isRead: false,
          },
        },

        upsert: true,
      },
    }));

    await Notification.bulkWrite(operations);
  }

  // Also sync notifications into Mentor's own collection.
  await syncMentorAnnouncementNotifications(
    announcement,
    audience
  );
};

// ============================================================
// CREATE ANNOUNCEMENT
// ============================================================

const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      audience,
      priority,
      status,
      date,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement title is required.",
      });
    }

    if (!description || !String(description).trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement description is required.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Announcement date is required.",
      });
    }

    const normalizedAudience = normalizeAudience(audience);

    if (!normalizedAudience) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement audience.",
      });
    }

    const announcement = await Announcement.create({
      title: String(title).trim(),
      description: String(description).trim(),
      audience: normalizedAudience,
      priority: priority || "Medium",
      status: status || "Published",
      date,
      createdBy: "Program Manager",
    });

    await syncAnnouncementNotifications(announcement);

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully.",
      data: announcement,
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create announcement.",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL ANNOUNCEMENTS
// ============================================================

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get Announcements Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements.",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE ANNOUNCEMENT
// ============================================================

const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Get Announcement Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcement.",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE ANNOUNCEMENT
// ============================================================

const updateAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      audience,
      priority,
      status,
      date,
    } = req.body;

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: "Announcement title is required.",
        });
      }

      announcement.title = String(title).trim();
    }

    if (description !== undefined) {
      if (!String(description).trim()) {
        return res.status(400).json({
          success: false,
          message: "Announcement description is required.",
        });
      }

      announcement.description = String(description).trim();
    }

    if (audience !== undefined) {
      const normalizedAudience = normalizeAudience(audience);

      if (!normalizedAudience) {
        return res.status(400).json({
          success: false,
          message: "Invalid announcement audience.",
        });
      }

      announcement.audience = normalizedAudience;
    }

    if (priority !== undefined) {
      announcement.priority = priority;
    }

    if (status !== undefined) {
      announcement.status = status;
    }

    if (date !== undefined) {
      announcement.date = date;
    }

    const updatedAnnouncement = await announcement.save();

    await syncAnnouncementNotifications(updatedAnnouncement);

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully.",
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Update Announcement Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update announcement.",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE ANNOUNCEMENT
// ============================================================

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    const announcementId = String(announcement._id);

    await Notification.deleteMany({
      sourceType: "Announcement",
      sourceId: announcementId,
    });

    await MentorNotification.deleteMany({
      sourceType: "Announcement",
      sourceId: announcementId,
    });

    await announcement.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Announcement and related notifications deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Announcement Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete announcement.",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
