import SFInfo from 'react-native-sensitive-info'
import { onSnapshot } from 'mobx-state-tree';
import AsyncStorage from "@react-native-async-storage/async-storage";

import Tokens from './../stores/Tokens';
import Auth from './../stores/Auth';

onSnapshot(Tokens, snapshot => { SFInfo.setItem('Tokens', JSON.stringify(snapshot), {}), console.log("SNAPSHOT:::TOKENS") });
onSnapshot(Auth, snapshot => { AsyncStorage.setItem('Auth', JSON.stringify(snapshot)), console.log("SNAPSHOT:::AUTH") });