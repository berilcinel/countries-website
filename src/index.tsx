import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';
import './styles.css'

// Define TypeScript interfaces for the data
interface Country {
    name: string;
    code: string;
    continent: {
        name: string;
    };
}

interface Data {
    countries: Country[];
}

// Create an ApolloClient instance to fetch data from a GraphQL API
const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: 'https://countries.trevorblades.com'
});

// Define a GraphQL query to retrieve a list of countries
const LIST_COUNTRIES = gql`
  {
    countries {
      name
      code
      continent {
        name
      }
    }
  }
`;

// Function to generate a random RGB color
function generateRandomColor(): string {
    const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
    return randomColor;
}

// Define props for the ContinentDropdown component
interface ContinentDropdownProps {
    continents: string[];
    selectedContinent: string | null;
    onContinentChange: (continent: string) => void;
}

// Define the ContinentDropdown component
const ContinentDropdown: React.FC<ContinentDropdownProps> = ({
    continents,
    selectedContinent,
    onContinentChange,
}) => {
    return (
        <div>
            <label htmlFor="continents"></label>
            <select
                id="continentfilter"
                value={selectedContinent || ''}
                onChange={(e) => onContinentChange(e.target.value)}
            >
                <option value="">-- Choose Continent --</option>
                {continents.map((continent, index) => (
                    <option key={index} value={continent}>
                        {continent}
                    </option>
                ))}
            </select>
        </div>
    );
};

// Define the CountrySelect component
function CountrySelect() {
    // Define state variables using the useState hook
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
    const [filterText, setFilterText] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Use the useQuery hook to fetch data from the GraphQL API
    const { data, loading, error } = useQuery<Data>(LIST_COUNTRIES, { client });

    // useEffect hook to handle side-effects after data fetching
    useEffect(() => {
        setSelectedCountry(null);
        if (!loading && data) {
            // Filter countries based on search text and selected continent
            const filteredCountries = data.countries.filter(country =>
                country.name.toLowerCase().includes(filterText.toLowerCase()) &&
                (!selectedContinent || country.continent.name === selectedContinent)
            );
            const itemsPerPage = 10;
            const startIndex = (currentPage - 1) * itemsPerPage;
            if (filteredCountries.length > 0) {
                const indexToSelect = Math.min(startIndex + 9, filteredCountries.length - 1);
                setSelectedCountry(filteredCountries[indexToSelect].code);
            }
        }
    }, [data, filterText, currentPage, loading, selectedContinent]);

    // Event handler for when a country is clicked
    const handleCountryClick = (code: string, continent: string) => {
        setSelectedCountry(code);
        setSelectedContinent(continent);
    };

    // Filter countries based on search text and selected continent
    const filteredCountries = data?.countries.filter(country =>
        country.name.toLowerCase().includes(filterText.toLowerCase()) &&
        (!selectedContinent || country.continent.name === selectedContinent)
    ) || [];

    // Pagination logic
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredCountries.length);
    const currentCountries = filteredCountries.slice(startIndex, endIndex);

    // Event handlers for pagination
    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    // Extract unique continent names for the dropdown
    const continents: string[] = Array.from(new Set(data?.countries.map(country => country.continent.name) || []));

    // Event handler for when a continent is selected in the dropdown
    const handleContinentChange = (selectedContinent: string) => {
        setSelectedContinent(selectedContinent);
    };

    // Render the UI
    return (
        <div>
            <label htmlFor="text"></label>
            <input
                id="searchfilter"
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search..."
            />
            {data && (
                <ContinentDropdown
                    continents={continents}
                    selectedContinent={selectedContinent || ''}
                    onContinentChange={handleContinentChange}
                />
            )}
            <ul>
                {currentCountries.map((country, index) => (
                    <li key={country.code}>
                        <button
                            onClick={() => handleCountryClick(country.code, country.continent.name)}
                            style={{
                                backgroundColor: selectedCountry === country.code ? generateRandomColor() : '',
                            }}
                        >
                            {country.name}
                        </button>
                    </li>
                ))}
            </ul>
            <div>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>

        </div>
    );
}

// Render the CountrySelect component to the DOM
ReactDOM.render(<CountrySelect />, document.getElementById('root'));
