const coursesData = [
    {
        id: 1,
        title: "Développement Web Frontend",
        description: "Maîtrisez les bases du développement web avec HTML5 et CSS3",
        category: "HTML/CSS",
        progress: 30,
        modules: [
            {
                id: 1,
                title: "Introduction au HTML",
                type: "text",
                content: "Le HTML (HyperText Markup Language) est le langage de balisage standard utilisé pour créer des pages web...",
                duration: "10 min",
                completed: true
            },
            {
                id: 2,
                title: "Les bases du CSS",
                type: "text",
                content: "Le CSS (Cascading Style Sheets) est utilisé pour styliser les pages web...",
                duration: "15 min",
                completed: true
            },
            {
                id: 3,
                title: "Flexbox et Grid",
                type: "video",
                content: "https://rr4---sn-uv2oxuuo-u0oz.googlevideo.com/videoplayback?expire=1763265002&ei=ivUYaeC8NdzgsfIP0OfN8Q4&ip=89.249.193.141&id=o-APzoW8Dbj0e_FRspCjzcKl_CaK-yxQ7blvD-B2AzGETP&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=0&rms=au%2Cau&bui=AdEuB5TYgsjnhDhUx7mH4OEa2OrQywoWSAw5P5faQ1JT-5S2ZdQKbLF3J4ZGdEr4pKkTCw8L7ayDO0on&spc=6b0G_K-hISQJ63Vj9XyMdKc_3veaXxusceyTOz2_Kuhx2nsWykxhPnNFo3_Rt1dkqN0&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&cnr=14&ratebypass=yes&dur=237.145&lmt=1742839700651502&fexp=51552689,51565115,51565682,51580968&c=ANDROID&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRgIhAIVkK1Zx9USJvz5c36F_9EgiwtLaREwt6yJA2gdRQZ9AAiEAzXVHJg-moEpfVexKo6CaHaOgO4UAMUXPY6ImhHyrRhw%3D&redirect_counter=1&rm=sn-a5meez7l&rrc=104&req_id=21a282920e69a3ee&cms_redirect=yes&cmsv=e&ipbypass=yes&met=1763243416,&mh=pt&mip=102.157.169.25&mm=31&mn=sn-uv2oxuuo-u0oz&ms=au&mt=1763243152&mv=m&mvi=4&pl=22&lsparams=cps,ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRQIhAOqVlEfHSYNaOfOq30PMu0dv4tSICqGECYfls-VTRr0pAiAktWE39GmbfpptHQ9sZSRZh2d05_zGxRDtF_VeS0SsSg%3D%3D",
                duration: "20 min",
                completed: false
            },
            {
                id: 4,
                title: "Quiz HTML/CSS",
                type: "quiz",
                questions: [
                    {
                        question: "Que signifie HTML?",
                        options: [
                            "HyperText Markup Language",
                            "HighTech Modern Language",
                            "Hyper Transfer Markup Language",
                            "Home Tool Markup Language"
                        ],
                        correct: 0
                    },
                    {
                        question: "Quelle propriété CSS change la couleur du texte?",
                        options: [
                            "text-color",
                            "font-color",
                            "color",
                            "text-style"
                        ],
                        correct: 2
                    },
                    {
                        question: "Quelle balise HTML est utilisée pour créer un lien?",
                        options: [
                            "<link>",
                            "<a>",
                            "<href>",
                            "<url>"
                        ],
                        correct: 1
                    }
                ],
                duration: "10 min",
                completed: false
            }
        ]
    },
    {
        id: 2,
        title: "JavaScript Moderne",
        description: "Apprenez à créer des sites web interactifs avec JavaScript",
        category: "JavaScript",
        progress: 15,
        modules: [
            {
                id: 1,
                title: "Variables et types de données",
                type: "text",
                content: "En JavaScript, on peut déclarer des variables avec var, let ou const...",
                duration: "12 min",
                completed: true
            },
            {
                id: 2,
                title: "Fonctions et portée",
                type: "text",
                content: "Les fonctions sont des blocs de code réutilisables...",
                duration: "18 min",
                completed: false
            },
            {
                id: 3,
                title: "Manipulation du DOM",
                type: "video",
                content: "https://rr4---sn-uv2oxuuo-u0oz.googlevideo.com/videoplayback?expire=1763265002&ei=ivUYaeC8NdzgsfIP0OfN8Q4&ip=89.249.193.141&id=o-APzoW8Dbj0e_FRspCjzcKl_CaK-yxQ7blvD-B2AzGETP&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=0&rms=au%2Cau&bui=AdEuB5TYgsjnhDhUx7mH4OEa2OrQywoWSAw5P5faQ1JT-5S2ZdQKbLF3J4ZGdEr4pKkTCw8L7ayDO0on&spc=6b0G_K-hISQJ63Vj9XyMdKc_3veaXxusceyTOz2_Kuhx2nsWykxhPnNFo3_Rt1dkqN0&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&cnr=14&ratebypass=yes&dur=237.145&lmt=1742839700651502&fexp=51552689,51565115,51565682,51580968&c=ANDROID&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRgIhAIVkK1Zx9USJvz5c36F_9EgiwtLaREwt6yJA2gdRQZ9AAiEAzXVHJg-moEpfVexKo6CaHaOgO4UAMUXPY6ImhHyrRhw%3D&redirect_counter=1&rm=sn-a5meez7l&rrc=104&req_id=21a282920e69a3ee&cms_redirect=yes&cmsv=e&ipbypass=yes&met=1763243416,&mh=pt&mip=102.157.169.25&mm=31&mn=sn-uv2oxuuo-u0oz&ms=au&mt=1763243152&mv=m&mvi=4&pl=22&lsparams=cps,ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRQIhAOqVlEfHSYNaOfOq30PMu0dv4tSICqGECYfls-VTRr0pAiAktWE39GmbfpptHQ9sZSRZh2d05_zGxRDtF_VeS0SsSg%3D%3D",
                duration: "25 min",
                completed: false
            }
        ]
    },
    {
        id: 3,
        title: "Backend avec PHP",
        description: "Créez des applications web dynamiques avec PHP et MySQL",
        category: "PHP",
        progress: 0,
        modules: [
            {
                id: 1,
                title: "Introduction à PHP",
                type: "text",
                content: "PHP est un langage de script côté serveur...",
                duration: "15 min",
                completed: false
            },
            {
                id: 2,
                title: "Variables et tableaux",
                type: "text",
                content: "En PHP, les variables commencent par le signe dollar ($)...",
                duration: "20 min",
                completed: false
            }
        ]
    }
];

let userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
let currentCourse = null;
let currentModuleIndex = 0;
let currentQuiz = null;
let currentQuestionIndex = 0;
let quizScore = 0;
let userAnswers = [];