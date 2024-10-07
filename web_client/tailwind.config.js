/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors:{
        primary:{
          light:'rgba(128, 128, 128, 0.15)',
          dark:'rgb(128, 128, 128)',
        },
        nav_text:'#B1B1B1',
        header_text:'#718EBF',
        date_bg:'#D9D9D9',
        welcome:'#343C6A',
        memos:"#C5C5CF",
        news_header:"#1B2559",
        news_body:"#8F9ABC",
        bg:"rgba(128, 128, 128, 0.10)",
        header_active_text:"#1814F3",
        edit_text:"#7854F7",
        profile_sub:"#A0AEC0",
        profile_header:"#2D3748",
        white_bg:"#ffffff",
        credentials_header:"#03014C",
        details_card_text:"#A3AED0",
        details_card_number:"#1B2559",
        backdrop:'rgba(0,0,0,0.3)',
        form_label:'#232323'
      },
      fontSize:{
        '2xl':'2.75em',
        'xl':'2.25em',
        lg:'1.75em',
        md:'1.125em',
        base:'0.875em',
        sm:'0.75em'
      }
    },
  },
  plugins: [],
}