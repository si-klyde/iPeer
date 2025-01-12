const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { auth, db, admin } = require('../firebaseAdmin');
const crypto = require('crypto');
const { encrypt } = require('../utils/encryption.utils');
const SECURITY_CONFIG = require('../config/security.config.js');

const hashPassword = (password, salt) => {
  let hash = crypto.createHmac(SECURITY_CONFIG.HASH_ALGORITHM, Buffer.from(salt, 'hex'))
    .update(password)
    .digest('hex');
    
  for (let i = 1; i < SECURITY_CONFIG.HASH_ITERATIONS; i++) {
    hash = crypto.createHmac(SECURITY_CONFIG.HASH_ALGORITHM, Buffer.from(salt, 'hex'))
      .update(hash)
      .digest('hex');
  }
  return hash;
};

const initialAdmins = [
    {
        username: "bucs_admin",
        password: "bucs_admin",
        college: "College of Science",
        role: "admin"
    },
    {
        username: "buce_admin",
        password: "buce_admin",
        college: "College of Education",
        role: "admin"
      },
      {
        username: "bucal_admin",
        password: "bucal_admin",
        college: "College of Arts and Letters",
        role: "admin"
      },
    //   {
    //     username: "ipesr_admin",
    //     password: "ipesr_admin",
    //     college: "Institute of Physical Education Sports and Recreation",
    //     role: "admin"
    //   },
  {
    username: "ipesr_admin",
    password: "ipesr_admin",
    college: "Institute of Physical Education Sports and Recreation",
    role: "admin"
  },

  {
    username: "bujmrigd_admin",
    password: "bujmrigd_admin",
    college: "Jesse M. Robredo Institute of Governance and Development",
    role: "admin"
  },

  {
    username: "bucn_admin",
    password: "bucn_admin",
    college: "College of Nursing",
    role: "admin"
  },

  {
    username: "buidea_admin",
    password: "buidea_admin",
    college: "Institute of Design and Architecture",
    role: "admin"
  },
  {
    username: "buceng_admin",
    password: "buceng_admin",
    college: "College of Engineering",
    role: "admin"
  },
  {
    username: "bucit_admin",
    password: "bucit_admin",
    college: "College of Industrial Technology",
    role: "admin"
  },
  {
    username: "bucssp_admin",
    password: "bucssp_admin",
    college: "College of Social Science and Philosophy",
    role: "admin"
  },
  {
    username: "bucbem_admin",
    password: "bucbem_admin",
    college: "College of Business Economics and Management",
    role: "admin"
  },
  {
    username: "bucm_admin",
    password: "bucm_admin",
    college: "College of Medicine",
    role: "admin"
  },
];

async function setupInitialAdmins() {
  try {
    for (const adminData of initialAdmins) {
      const salt = crypto.randomBytes(SECURITY_CONFIG.SALT_BYTES).toString('hex');
      const hashedPassword = hashPassword(adminData.password, salt);

      const userRecord = await auth.createUser({
        password: hashedPassword
      });

      await db.collection('admins').doc(userRecord.uid).set({
        username: encrypt(adminData.username),
        college: encrypt(adminData.college),
        role: adminData.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.collection('admins')
        .doc(userRecord.uid)
        .collection('auth')
        .doc('credentials')
        .set({
          salt,
          password: hashedPassword
        });

      await auth.setCustomUserClaims(userRecord.uid, {
        role: adminData.role,
        isAdmin: true
      });

      console.log(`Admin account created successfully for ${adminData.username}`);
    }
    console.log('Initial admin setup completed');
  } catch (error) {
    console.error('Error creating admin accounts:', error);
  }
}

setupInitialAdmins();
