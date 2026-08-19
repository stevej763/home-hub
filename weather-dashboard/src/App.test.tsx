import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('renders the nav brand and links', () => {
        render(<App />);

        expect(screen.getByText('Weather')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Stations' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Locations' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Control room' })).toBeInTheDocument();
    });
});
