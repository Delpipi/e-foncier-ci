tailwind.config = {
    theme: {
        extend: {
            colors: {
                //Couleurs personnalisées
                primary: '#283618',
                secondary: '#BC6C25',
                accent: {
                    1: '#606C38',
                    2: '#DDA15E',
                    3: '#FEFAE0'
                }
            },
            fontFamily: {
                jost: ['"Jost"', 'sans-serif'],
                roboto: ['"Roboto"', 'sans-serif'],
            },
            
            fontSize: {
                // Tailles personnalisées
                'small': '1rem',
                'medium': '1.5rem',
                'large': '2rem',
                'massive': '5rem'
            },
            spacing: {
                // Tailles pour padding/margin
                'xsmall': '0.5em',
                'small': '1rem',
                'medium': '1.5rem',
                'large': '2rem',
                'massive': '5rem'
            },
            boxShadow: {
                'inner-sm': 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',  // Small inner shadow
                'inner-md': 'inset 0 4px 6px rgba(0, 0, 0, 0.1)',  // Medium inner shadow
                'inner-lg': 'inset 0 8px 12px rgba(0, 0, 0, 0.1)', // Large inner shadow
            },
            animation: {
                'float': 'float 3s ease infinite',
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'vibrate-slow': 'vibrateSlow 1s linear',
                'blink-1': 'blink1 5s linear 0s infinite normal none'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                vibrateSlow: {
                    '0%': {
                        transform: 'translate(0, 0)',
                    },
                    '20%': {
                        transform: 'translate(2px, -2px)',
                    },
                    '40%': {
                        transform: 'translate(2px, 2px)',
                    },
                    '60%': {
                        transform: 'translate(-2px, 2px)',
                    },
                    '80%': {
                        transform: 'translate(-2px, -2px)',
                    },
                    '100%': {
                        transform: 'translate(0, 0)',
                    }
                },
                float: {
                    '0%,100%': {
                        transform: 'translateY(0)',
                    },
                    '25%': {
                        transform: 'translateY(-10px)',
                    },
                    '50%':{
                        transform: 'translateY(-5px)',
                    },
                    '75%': {
                        transform: 'translateY(-15px)'
                    }
                }
            }
        }
    }
}