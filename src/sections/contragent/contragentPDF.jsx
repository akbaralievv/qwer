/* eslint-disable */
import PropTypes from 'prop-types';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

import PTSerifItalic from '../../fonts/PTSerif-Italic.ttf';
import PTSerifBoldItalic from '../../fonts/PTSerif-BoldItalic.ttf';
import PTSerifBold from '../../fonts/PTSerif-Bold.ttf';

Font.register({
  family: 'PTSerif',
  fonts: [
    { src: PTSerifItalic, fontStyle: 'italic', fontWeight: 'normal' },
    { src: PTSerifBoldItalic, fontStyle: 'italic', fontWeight: 'bold' },
    { src: PTSerifBold, fontStyle: 'normal', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 25,
    fontFamily: 'PTSerif',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: 70,
    height: 90,
    marginRight: 15,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  content: {
    padding: 10,
  },
  textItem: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
  hr: {
    width: '100%',
    height: 1,
    backgroundColor: '#000',
    marginVertical: 10,
  },
  footer: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
  },
  textFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'start',
  },
});

const ContragentPDFFile = ({ contragent }) => {
  return (
    <Document>
      <Page style={styles.page} size="A4" orientation="portrait">
        <Text style={[styles.title, { marginBottom: '15px', textAlign: 'center' }]}>
          Личная карточка студента
        </Text>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { paddingBottom: '-25px' }]}>
              Дата приема «________» ______________ 20____г.
            </Text>
          </View>
          <View style={[{ paddingRight: '15px' }]}>
            <Text style={[styles.textItem]}>
              Место {'\n'} для фото {'\n'} 3 x 4
            </Text>
          </View>
        </View>

        <View style={styles.hr} />

        <View style={styles.textFlex}>
          <View>
            <Text style={styles.textItem}>ФИО: {contragent.name}</Text>
            <Text style={styles.textItem}>Адрес проживания: {contragent.address}</Text>
            <Text style={styles.textItem}>ИНН: {contragent.inn}</Text>
            <Text style={styles.textItem}>Номер телефона: {contragent.tel}</Text>
            <Text style={styles.textItem}>Email: {contragent.email}</Text>
            <Text style={styles.textItem}>Резидент: {contragent.resident}</Text>
          </View>
          <View>
            <Text style={styles.textItem}>
              Формат обучения:{' '}
              {contragent?.division?.attributes?.title !== 'full-time'
                ? 'очное обучение'
                : 'заочное обучение'}
            </Text>
            <Text style={styles.textItem}>
              Факультет: {contragent?.subdiv_one?.data?.attributes?.title || 'N/A'}
            </Text>
            <Text style={styles.textItem}>
              Курс: {contragent?.division?.data?.attributes?.title || 'N/A'}
            </Text>
            <Text style={styles.textItem}>Лицевой счет: {contragent.ls}</Text>
          </View>
        </View>

        <View style={styles.hr} />

        <Text style={styles.footer}>Данные контрагента - 2024</Text>
        <Text style={styles.footer}>KMSI || КМСИ</Text>
      </Page>
    </Document>
  );
};

ContragentPDFFile.propTypes = {
  contragent: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    inn: PropTypes.string.isRequired,
    tel: PropTypes.string.isRequired,
    is: PropTypes.any,
    email: PropTypes.string.isRequired,
    resident: PropTypes.string.isRequired,
    divisions: PropTypes.object,
    subdiv_one: PropTypes.object,
  }).isRequired,
};

export default ContragentPDFFile;
