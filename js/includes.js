<footer>
        <p>&copy; 2024 Ahilya Army Bharat Ekta Mission. All Rights Reserved.</p>
    </footer>
    
    <!-- Google Translate Element -->
    <div id="google_translate_element" style="display:none;"></div>

    <script src="js/main.js"></script>

    <!-- Google Translate Scripts for Custom Button -->
    <script type="text/javascript">
    function googleTranslateElementInit() {
      new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'en,hi', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false}, 'google_translate_element');
    }

    function getCookie(name) {
        var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    }

    function setCookie(name, value, days) {
        var d = new Date;
        d.setTime(d.getTime() + 24*60*60*1000*days);
        document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
    }

    function toggleLanguage() {
        var langCookie = getCookie('googtrans');
        // If cookie is /en/hi, switch to english, else switch to hindi
        if (langCookie === '/en/hi') {
            changeLanguage('en');
        } else {
            changeLanguage('hi');
        }
    }

    function changeLanguage(lang) {
        var currentLang = getCookie('googtrans');
        if (!currentLang) {
            currentLang = '/en/en'; // Default
        }
        
        // This sets the cookie that Google Translate reads on the next page load
        setCookie('googtrans', '/en/' + lang, 1);
        
        // Reload the page to apply the new language
        window.location.reload();
    }
    </script>
    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>