const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'orcamento', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `              className="step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
              <h1 className="step-question" style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>Mensagem Encaminhada!</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
              className="step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
              <h1 className="step-question" style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>Mensagem Encaminhada!</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>`;

const replacement = `              className="step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
              <h1 className="step-question" style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>Mensagem Encaminhada!</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>`;

content = content.replace(targetStr, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed duplicated lines.');
