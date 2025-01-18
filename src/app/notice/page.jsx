"use client"
import Layout from '../components/layout'
import styled from 'styled-components'
import DataDisplay from '../components/display-notices'
import LoadAnimation from '../components/loading'
import { useSession } from 'next-auth/react'
import Loading from '../components/loading'
import Sign from '../components/signin'
import Unauthorise from '../components/unauthorise'
import { useEffect, useState } from 'react'

const Wrap = styled.div`
    width: 90%;
    margin: auto;
    margin-top: 60px;
`

export default function Page() {
    const [isLoading, setIsLoading] = useState(true)
    const [entries, setEntries] = useState([])
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/notice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    from: 0,
                    to: 15,
                    type: "between"
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setEntries(data)
                    setIsLoading(false)
                })
                .catch((err) => {
                    console.error(err)
                    setIsLoading(false)
                })
        }
    }, [status])

    // Handle loading state
    if (status === 'loading') {
        return <Loading />
    }

    // Handle unauthenticated state
    if (status === 'unauthenticated') {
        return <Sign />
    }

    // Handle authenticated state
    if (session?.user?.role === "SUPER_ADMIN") {
        return (
            <Layout>
                <Wrap>
                    {isLoading ? (
                        <LoadAnimation />
                    ) : (
                        <DataDisplay data={entries} />
                    )}
                </Wrap>
            </Layout>
        )
    }

    // Handle unauthorized role
    return <Unauthorise />
}
