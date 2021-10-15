import SFInfo from 'react-native-sensitive-info'
import { onSnapshot } from 'mobx-state-tree';

import Tokens from './../stores/Tokens'

onSnapshot(Tokens, snapshot => { SFInfo.setItem('Tokens', JSON.stringify(snapshot), {}), console.log("SNAPSHOT:::TOKENS") });