const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dtos');
const userModel = require('../models/user-model');
const ApiError = require('../exceptions/api-errors')

class UserService {

  async registration(username, email, password) {
    const candidate = await userModel.findOne({email});

    if (candidate) {
      throw ApiError.BadRequest(`User with email ${email} already exist`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    
    const activationLink = uuid.v4();
    
    const user = await userModel.create({username, email, password: hashPassword, activationLink});
    await mailService.sendActivationEmail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto});
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto
    }
  }

  async activate(activationLink) {
    const user = await userModel.findOne({activationLink})

    if(!user) {
      throw ApiError.BadRequest('Uncorrected activate link');
    }

    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await userModel.findOne({email});

    if(!user) {
      throw ApiError.BadRequest('User with this email does not found')
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if(!isPassEquals) {
      throw ApiError.BadRequest('Uncorected password')
    }

    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto});
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto
    }
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if(!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if(!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await userModel.findById(userData.id);
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto});
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto
    }
  }

  async getAllUsers() {
    const users = await userModel.find();
    return users;
  }
}

module.exports = new UserService();
