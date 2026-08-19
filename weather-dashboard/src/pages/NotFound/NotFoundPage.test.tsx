import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
    it('renders the not-found message and a link back home', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(screen.getByText('No signal from this station')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Back to stations' })).toHaveAttribute('href', '/');
    });
});
