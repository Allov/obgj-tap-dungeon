class Config {
    get soundOn() {
        if (window.localStorage.getItem('soundOn') === null) {
            window.localStorage.setItem('soundOn', true);
        }

        return window.localStorage.getItem('soundOn') == "true";
    }

    set soundOn(value) {
        window.localStorage.setItem('soundOn', value);
    }
}

export let config = new Config();
