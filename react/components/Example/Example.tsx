import React, { Fragment, useState, useEffect, useRef } from 'react'
import $ from "jquery";
import styles from './styles.css'

const Example: StorefrontFunctionComponent = (props: any) => {
  const [state, setState] = useState({
    scriptLoaded: false,
    loading: false,
  })

  const { scriptLoaded, loading } = state

  const divContainer = useRef<any>(null)

  useEffect(() => {
    injectScript(
      'google-recaptcha-v2',
      'https://recaptcha.net/recaptcha/api.js?render=explicit',
      handleOnLoad
    )
    $(window).trigger('removePaymentLoading.vtex')
  }, [])

  const respondTransaction = (status: boolean) => {
    $(window).trigger('transactionValidation.vtex', [status])
  }

  const handleOnLoad = () => {
    setState({ ...state, scriptLoaded: true })
    window?.grecaptcha.ready(() => {
      window?.grecaptcha.render(divContainer.current, {
        sitekey: '------>REPATCHA_V2_SITE_KEY<------', //Replace with site key
        theme: 'dark',
        callback: onVerify,
      })
    })
  }

  const onVerify = (_e: any) => {
    const parsedPayload = JSON.parse(props.appPayload)
    setState({ ...state, loading: true })

    fetch(parsedPayload.approvePaymentUrl).then(() => {
      respondTransaction(true)
    })
  }

  const cancelTransaction = () => {
    const parsedPayload = JSON.parse(props.appPayload)
    setState({ ...state, loading: true })

    fetch(parsedPayload.denyPaymentUrl).then(() => {
      respondTransaction(false)
    })
  }

  const confirmTransation = () => {
    const parsedPayload = JSON.parse(props.appPayload)
    setState({ ...state, loading: true })

    fetch(parsedPayload.approvePaymentUrl).then(() => {
      respondTransaction(true)
    })
  }

  const injectScript = (id: string, src: string, onLoad: ((this: GlobalEventHandlers, ev: Event) => any) | null) => {
    if (document.getElementById(id)) {
      return
    }

    const head = document.getElementsByTagName('head')[0]

    const js = document.createElement('script')
    js.id = id
    js.src = src
    js.async = true
    js.defer = true
    js.onload = onLoad

    head.appendChild(js)
  }

  return (
    <div className={styles.wrapper}>
      {scriptLoaded && !loading ? (
        <Fragment>
          <div className="g-recaptcha" ref={divContainer}></div>
          <button
            id="payment-app-confirm"
            className={styles.buttonSuccess}
            onClick={confirmTransation}>
            Confirmar
          </button>
        </Fragment>
      ) : (
        <h2>Carregando...</h2>
      )}

      {!loading && (
        <button
          id="payment-app-cancel"
          className={styles.buttonDanger}
          onClick={cancelTransaction}>
          Cancelar
        </button>
      )}
    </div>
  )
}

export default Example
