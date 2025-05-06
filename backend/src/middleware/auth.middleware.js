const jwt = require('jsonwebtoken');
const { Device } = require('../models/device.model');

const authenticateDevice = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const device = await Device.findOne({
      deviceId: decoded.deviceId,
      revoked: false
    });
    
    if (!device) throw new Error('Device revoked');
    
    req.device = {
      id: device.deviceId,
      role: device.role,
      location: device.location
    };
    
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.device.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

module.exports = { authenticateDevice, authorizeRole };