import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Home } from '.';

const handlers = [
  rest.get('*jsonplaceholder.typicode.com/posts*', async (req, res, ctx) => {
    return res(
      ctx.json([
        {
          userId: 1,
          id: 1,
          title: 'title1',
          body: 'body1',
          url: 'img1.jpg',
        },
        {
          userId: 1,
          id: 2,
          title: 'title2',
          body: 'body2',
          url: 'img1.jpg',
        },
        {
          userId: 1,
          id: 3,
          title: 'title3',
          body: 'body3',
          url: 'img1.jpg',
        },
      ]),
    );
  }),
  rest.get(
    'https://jsonplaceholder.typicode.com/photos',
    async (req, res, ctx) => {
      return res(
        ctx.json([
          {
            url: 'img1.jpg',
          },
          {
            url: 'img2.jpg',
          },
          {
            url: 'img3.jpg',
          },
        ]),
      );
    },
  ),
];

const server = setupServer(...handlers);

describe('<Home/>', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => {
    server.close();
  });

  it('should render search, posts and load more', async () => {
    render(<Home />);
    const noMorePosts = screen.getByText('Não existem posts =(');

    expect.assertions(3);

    await waitForElementToBeRemoved(noMorePosts);

    const search = screen.getByPlaceholderText(/type your search/i);
    expect(search).toBeInTheDocument();

    const images = screen.getAllByRole('img', { name: /title/i });
    expect(images).toHaveLength(3);

    const button = screen.getByRole('button', { name: /load more posts/i });
    expect(button).toBeInTheDocument();
  });

  it('should search for post ', async () => {
    render(<Home />);
    const noMorePosts = screen.getByText('Não existem posts =(');

    expect.assertions(11);

    await waitForElementToBeRemoved(noMorePosts);

    const search = screen.getByPlaceholderText(/type your search/i);

    expect(
      screen.getByRole('heading', { name: 'title11' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'title22' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'title3 3' }),
    ).not.toBeInTheDocument();

    userEvent.type(search, 'title1');
    expect(
      screen.getByRole('heading', { name: 'title11' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'title2 2' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'title3 3' }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Search value: title1' }),
    ).toBeInTheDocument();

    userEvent.clear(search);
    expect(
      screen.getByRole('heading', { name: 'title11' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'title2 2' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'title3 3' }),
    ).not.toBeInTheDocument();

    userEvent.type(search, 'post does not exist');
    expect(screen.getByText('Não existem posts =(')).toBeInTheDocument();
  });

  it('should load more posts', async () => {
    render(<Home />);
    const noMorePosts = screen.getByText('Não existem posts =(');

    // expect.assertions(3);

    await waitForElementToBeRemoved(noMorePosts);

    const button = screen.getByRole('button', { name: /load more posts/i });

    userEvent.click(button);
    expect(
      screen.getByRole('heading', { name: 'title33' }),
    ).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
