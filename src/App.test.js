import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import mockResponse from './__mocks__/subreddit-reactjs-response.json'
import App from './App';

// Since we use jest-mock-fetch the global fetch is replaced with a mock function.
fetchMock.enableMocks()

const setup = () => {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  )
}
describe('Header', () => {
  // https://jestjs.io/docs/en/api#testeachtablename-fn-timeout
  test.each(['How it works', 'About'])('"%s" link points to the correct page', (linkName) => {
    setup()
    // screen.debug() prints the full DOM of the App
    const nameRegEx = new RegExp(linkName, 'i')
    const link = screen.getByRole('link', { name: nameRegEx })
    screen.debug(link)
    userEvent.click(link)

    const heading = screen.getByRole('heading', { name: nameRegEx })
    screen.debug(heading)
    expect(heading).toBeInTheDocument()
  }, 5000)

  test('The logo link brings back the main page', () => {
    setup()

    const logo = screen.getByRole('link', { name: 'logo.svg' })
    screen.debug(logo)
    userEvent.click(logo)

    const mainHeading = screen.getByRole('heading', { name: /Find the top posts on Reddit/i })
    screen.debug(mainHeading)

    expect(mainHeading).toBeInTheDocument()
    const input = screen.getByRole('textbox', { name: 'r /' })
    screen.debug(input)
    expect(input).toBeInTheDocument()
  })
});

describe('Subreddit form', () => {
  test('Loads posts that are rendered on the page', async () => {
    // https://github.com/jefflau/jest-fetch-mock#api
    // mockResponse contains a typical REST response for the subreddit fetch request
    fetch.mockResponseOnce(JSON.stringify(mockResponse)) // or fetch.once() for short
    setup()

    const subredditInput = screen.getByLabelText('r /')
    screen.debug(subredditInput)
    // https://github.com/testing-library/user-event
    const inputText = 'reactjs'
    userEvent.type(subredditInput, inputText)

    const submitButton = screen.getByRole('button', { name: /search/i })
    screen.debug(submitButton)
    userEvent.click(submitButton)

    expect(fetch).toHaveBeenCalledWith(`https://www.reddit.com/r/${inputText}/top.json`)
    const loadingMessage = screen.getByText(/is loading/i)
    expect(loadingMessage).toBeInTheDocument()
    const responseMessage = await screen.findByText(/number of top posts:/i)
    expect(responseMessage).toBeInTheDocument()
    screen.debug(responseMessage)
  })
});
