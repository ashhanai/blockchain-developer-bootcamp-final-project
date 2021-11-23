import React from 'react';
import { Container } from 'react-bootstrap';
import MyNftList from "../../components/MyNftList";
import MyLendingList from "../../components/MyLendingList";
import MyBorrowingList from "../../components/MyBorrowingList";
import MyOfferList from "../../components/MyOfferList";


const Home = () => {
    return (
        <Container className="mt-5">
            <MyNftList />
            <MyBorrowingList />
            <MyLendingList />
            <MyOfferList />
        </Container>
    );
};

export default Home;
