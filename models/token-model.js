const {Schema, model} = require('mongoose');

const TokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  isActivated: { type: Boolean, default: false },
});

module.exports = model('Token', TokenSchema);