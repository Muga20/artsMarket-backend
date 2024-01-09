const SocialLinks = require("../models/user/socialLinks");

const getSocialLinks = async (req, res) => {
  try {
    const accessToken = req.user;
    const user_id = accessToken.userId.id;

    const socialLinks = await SocialLinks.findOne({
      where: {
        userId: user_id,
      },
    });

    res.status(200).send({socialLinks});
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


const updateSocialLinks = async (req, res) => {
  try {

    const accessToken = req.user;
    const user_id = accessToken.userId.id;

    // Retrieve the user's existing data from the database
    const user = await SocialLinks.findByPk(user_id);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Update the user data with the fields provided in the request body
    const updatedData = {
      facebook: req.body.facebook || user.facebook,
      twitter: req.body.twitter || user.twitter,
      instagram: req.body.instagram || user.instagram,
      reddit: req.body.reddit || user.reddit,
      pinterest: req.body.pinterest || user.pinterest,
    };

    // Update the user record in the database with the new data
    await user.update(updatedData);

    // Fetch the updated socialLinks row
    const updatedSocialLinks = await SocialLinks.findByPk(user_id);

    res.status(200).send(updatedSocialLinks);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


module.exports = {
  getSocialLinks,
  updateSocialLinks,
};
