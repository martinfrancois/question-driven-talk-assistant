import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import App from "../src/App";

test('renders name', async () => {
    const { getByText } = render(<App />)

    await expect.element(getByText('FancyCon 2024')).toBeInTheDocument()
    // await getByRole('button', { name: 'Increment '}).click()

    // await expect.element(getByText('Hello Vitest x2!')).toBeInTheDocument()
})