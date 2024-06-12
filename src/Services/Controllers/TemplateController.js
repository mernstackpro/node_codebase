const Template = require("../models/public/Template");
const User = require("../models/public/users");
const { NotificationAdd } = require('./../../libs/Helper')
// Controller to handle the creation of templates
exports.createTemplate = async (req, res) => {
  try {
    // Extract the necessary fields from the request body
    const { userId, content, backgroundColor, landingContent, landingBgColor, linkText, templateType, preExists } =
      req.body;

    // Check if both logo and thumbnail files were uploaded

    if (!req.files || !req.files.landingLogo || !req.files.logo) {
      return res
        .status(400)
        .json({ message: "Please upload both landingLogo and logo images" });
    }

    // Get the paths of the uploaded files from req.files object

    const landingLogoPath = req.files.landingLogo[0].path;
    const logoPath = req.files.logo[0].path;

    // Create a new template object
    const newTemplate = new Template({
      userId,
      content,
      backgroundColor,
      logo: logoPath.substring(logoPath.indexOf("public/") + 7),
      landingContent,
      landingBgColor,
      linkText,
      templateType,
      landingLogo: landingLogoPath.substring(
        landingLogoPath.indexOf("public/") + 7
      ),
      preExists: preExists
    });

    // Save the template to the database
    await newTemplate.save();

    const notificationMessage = `New template has been added`;


    NotificationAdd(userId, 'admin', notificationMessage)

    // Respond with success message
    return res.status(201).json({ message: "Template created successfully" });
  } catch (error) {
    console.error("Error creating template:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.updateTemplateById = async (req, res) => {
  try {
    const templateId = req.params.id; // Extract template ID from request parameters

    // Extract the fields that can be updated from the request body
    const { userId, content, backgroundColor, landingContent, landingBgColor, linkText, templateType, preExists } = req.body;

    // Find the template by ID
    const template = await Template.findById(templateId);

    // If template not found, return 404 Not Found
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check if logo file was uploaded
    if (req.files && req.files.logo) {
      // Get the path of the uploaded logo file from req.files object
      const logoPath = req.files.logo[0].path;

      // Update the logo path only if a new logo was uploaded
      template.logo = logoPath.substring(logoPath.indexOf("public/") + 7);
    }

    if (req.files && req.files.landingLogo) {
      // Get the path of the uploaded logo file from req.files object
      const landingLogoPath = req.files.landingLogo[0].path;

      // Update the logo path only if a new logo was uploaded
      template.landingLogo = landingLogoPath.substring(landingLogoPath.indexOf("public/") + 7);
    }

    // Update template fields with new values
    template.userId = userId;
    template.content = content;
    template.backgroundColor = backgroundColor;
    template.landingContent = landingContent;
    template.landingBgColor = landingBgColor;
    template.linkText = linkText;
    template.templateType = templateType;

    // Save the updated template to the database
    await template.save();

    const notificationMessage = `Template has been Updated`;


    NotificationAdd(userId, 'admin', notificationMessage)

    // Respond with success message
    return res.status(200).json({ message: "Template updated successfully" });
  } catch (error) {
    console.error("Error updating template:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to get a template by its ID
exports.getTemplateById = async (req, res) => {
  try {
    const templateId = req.params.id;

    // Find the template by its ID
    const template = await Template.findById(templateId);

    // Check if the template exists
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Respond with the template data
    return res.status(200).json({ template: template, success: true });
  } catch (error) {
    console.error("Error getting template by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const userId = req.body.userId; // Assuming the user ID is available in the request object
    const superAdmin = await User.find({ role: 'superadmin' })

    console.log('superAdmin', superAdmin[0]?._id)

    const templates = await Template.find({ $or: [{ userId: userId }, { preExists: true }] });

    // Respond with the list of templates
    return res.status(200).json(templates);
  } catch (error) {
    console.error("Error getting all templates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteTemplateById = async (req, res) => {
  try {
    const templateId = req.params.id;

    // Find the template by its ID and delete it
    const templatedb = await Template.findById(templateId);

    const deletedTemplate = await Template.findByIdAndDelete(templateId);

    // Check if the template exists
    if (!deletedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }


    const notificationMessage = `Template has been Deleted`;


    NotificationAdd(templatedb.userId, 'admin', notificationMessage)

    // Respond with a success message
    return res.status(200).json({ message: "Template deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting template by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


