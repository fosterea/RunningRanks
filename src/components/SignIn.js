import React, {useEffect} from 'react'
import { uiConfig, ui } from '../setup/firebase'


export default function SignIn({ redirect_url }) {

    useEffect(() => {
        if (redirect_url != null) {
            uiConfig.signInSuccessUrl = redirect_url
            uiConfig.callbacks.signInSuccessWithAuthResult = () => true
        }
        ui.start('#firebase-ui-auth', uiConfig)
    }, [redirect_url])

    return (
        <div className="content">
            <div id="firebase-ui-auth"></div>
        </div>
    )
}
