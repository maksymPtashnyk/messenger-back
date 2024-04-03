const UserModel = require('../models/user-model');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dtos');

class UserService {

  async registration(username, email, password) {
    const candidate = await UserModel.findOne({email});

    if (candidate) {
      throw new Error(`User with email ${email}  already exist`)
    }
    const hashPassword = await bcrypt.hash(password, 3);
    
    const activationLink = uuid.v4();
    
    const user = await UserModel.create({username, email, password: hashPassword, activationLink});
    await mailService.sendActivationEmail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto});
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto
    }
  }
}

module.exports = new UserService();