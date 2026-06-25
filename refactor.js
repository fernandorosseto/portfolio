const fs = require('fs');
let content = fs.readFileSync('src/app/orcamento/page.js', 'utf8');

content = content.replace(
  "import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';",
  "import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';"
);

content = content.replace(
  '<div className="form-step-container">',
  '<div className="form-step-container" style={{ overflowX: \'hidden\' }}>\n          <AnimatePresence mode="wait">'
);

content = content.replace(
  '        </div>\n      </div>\n    </main>',
  '          </AnimatePresence>\n        </div>\n      </div>\n    </main>'
);

for(let i=1; i<=6; i++) {
  const findRegex = new RegExp('{step === ' + i + ' && \\(\\s*<div className="step-content fade-in-up"(.*?)(>)', 'g');
  const replaceStr = '{step === ' + i + ' && (\n            <motion.div \n              key="step' + i + '"\n              initial={{ opacity: 0, x: 100 }}\n              animate={{ opacity: 1, x: 0 }}\n              exit={{ opacity: 0, x: -100 }}\n              transition={{ duration: 0.4, ease: "easeInOut" }}\n              className="step-content"$1$2';
  content = content.replace(findRegex, replaceStr);
}

content = content.replace(/<\/div>\s*\n\s*\)}/g, '</motion.div>\n          )}');

fs.writeFileSync('src/app/orcamento/page.js', content);
console.log('Success!');
