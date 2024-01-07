import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { SnackbarProvider } from 'notistack'

const client = new ApolloClient({
    uri: 'http://localhost:4000',
    cache: new InMemoryCache()
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <ApolloProvider client={client}>
        <SnackbarProvider>
            <App />
        </SnackbarProvider>
    </ApolloProvider>
)