export default function getAnimation(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 160" role="img" aria-label="Cat-camel animation">
 <defs><linearGradient id="catcamel-shirt" x2="0" y2="1"><stop stop-color="#38b99b"/><stop offset="1" stop-color="#237f70"/></linearGradient></defs>
 <path d="M35 139H265" stroke="currentColor" stroke-width="2" opacity=".28" stroke-linecap="round"/>
 <g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M92 78L77 105L77 132M124 78L124 105L124 132M190 78L207 105L207 132M171 78L171 105L171 132" stroke="#344256" stroke-width="8"/>
  <path d="M92 78L77 105L77 132M124 78L124 105L124 132" stroke="#dca98b" stroke-width="6"/>
  <path d="M102 75 Q148 42 194 75" stroke="url(#catcamel-shirt)" stroke-width="11"><animate attributeName="d" dur="4.8s" repeatCount="indefinite" values="M102 75 Q148 42 194 75;M102 75 Q148 106 194 75;M102 75 Q148 42 194 75"/></path>
  <path d="M194 75 Q208 68 217 59" stroke="#dca98b" stroke-width="7"><animate attributeName="d" dur="4.8s" repeatCount="indefinite" values="M194 75 Q208 68 217 59;M194 75 Q210 75 218 82;M194 75 Q208 68 217 59"/></path>
 </g>
 <circle cx="225" cy="54" r="11" fill="#dca98b" stroke="currentColor" stroke-width="2"><animate attributeName="cy" dur="4.8s" repeatCount="indefinite" values="54;80;54"/></circle>
 <path d="M231 51l7 2" stroke="#344256" stroke-width="2" stroke-linecap="round"/>
 <circle cx="228" cy="52" r="1.5" fill="#344256"/>
 <path d="M145 54q3 -7 6 0" fill="none" stroke="#fff" stroke-width="2" opacity=".65"><animate attributeName="opacity" dur="4.8s" values=".2;.8;.2" repeatCount="indefinite"/></path>
</svg>`}