const chai = require('chai')
const fs = require('fs')
const util = require('util')
const p = require('path');
const readdir = util.promisify(fs.readdir);
const { expect } = chai
import BeginnersWish from '../src/models/beginners-wish'
import EpitomeInvocation from '../src/models/epitome-invocation'
import WanderlustInvocation from '../src/models/wanderlust-invocation'
import AdriftInTheHarbor from '../src/models/adrift-in-the-harbor'
import itemSchema from './schema/item'
let adrift = null
let beginners = null
let epitome = null
let wanderlust = null

describe('Validate that all data has valid images', () => {
  it('should have an image for each item', async () => {
      try {
        let adrift = require('../src/data/adrift-in-the-harbor.json')
        let wanderlust = require('../src/data/wanderlust-invocation.json')
        let epitome = require('../src/data/epitome-invocation.json')
        const weaponPix = await readdir(p.join(__dirname, '../src/assets/images/weapons'))
        const characterPix = await readdir(p.join(__dirname, '../src/assets/images/characters'))
        const pics = [...weaponPix, ...characterPix]
        const arrs = [adrift, wanderlust, epitome]
        const missingImages = []
        arrs.forEach((arr, i) => {
          arr.forEach(item => {
            if (!pics.some(pic => pic === item.src)) {
              missingImages.push({
                name: item.name,
                i
              })
            }
          })
        })
        if(missingImages.length) {
          throw missingImages
        }
      } catch(err) {
        expect.fail(`There are some missing images, here is the data ${JSON.stringify(err)}`)
      }
  })
})

describe('User can Wish x10', () => {
  ////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////Testing Adrift in the Harbor//////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  describe('Adrift in the Harbor', () => {
    it('should return an instance of Adrift in the Harbor', done => {
      adrift = new AdriftInTheHarbor()
      expect(adrift instanceof AdriftInTheHarbor).to.be.true
      done()
    })
    it('should have a 4 or 5 star item', done => {
      const results = adrift.roll()
      const item = results.find(item => item.rating === 4 || item.rating === 5)
      expect(!!(item)).to.be.true
      done()
    })
    it('should register 10 attempts', done => {
      expect(adrift.attemptsCount).to.be.equal(10)
      done()
    })
    it('should give us a total of 10 items', done => {
      const results = adrift.roll()
      expect(results.length === 10).to.be.true
      done()
    })
    it('should have a guaranteed 5 star item', done => {
      for(let i = 0; i < 6; i++) {
        adrift.roll()
      }
      const results = adrift.roll()
      const item = results.find(item => item.rating === 5)
      expect(!!(item)).to.be.true
      done()
    })
    it('should register 90 attempts', done => {
      expect(adrift.attemptsCount).to.be.equal(90)
      done()
    })
    it('should have another guaranteed 5 star item', done => {
      for (let i = 0; i < 8; i++) {
        adrift.roll()
      }
      const results = adrift.roll()
      const item = results.find(item => item.rating === 5)
      expect(!!(item)).to.be.true
      done()
    })
    it('should register 180 attempts', done => {
      expect(adrift.attemptsCount).to.be.equal(180)
      done()
    })
    it('should have guaranteed Ganyu', done => {
      // Initialize required variables.
      const results = [];
      const adriftGanyu = new AdriftInTheHarbor();
      const guaranteedGachaLimit = 18;
      let hasGanyu = false;

      // Logically, we'll get Ganyu after 180 pulls (guaranteed SSR every 90 pulls, then the next one will be Ganyu).
      // Henceforth, it is the maximum pull.
      for (let i = 0; i < guaranteedGachaLimit; i++) {
        results.push(adriftGanyu.roll());

        // Then, if we get Ganyu in less than 180 pulls, set 'hasGanyu' to true and exit the loop.
        if (results[i].find(item => item.rating === 5 && item.name === 'Ganyu')) {
          hasGanyu = true;
          break;
        }
      }

      expect(hasGanyu).to.be.true;
      done();
    })
    it('should give a Ganyu after pulling an SSR that is not Ganyu (first Ganyu pull is also acceptable)', done => {
      const results = [];
      const adriftGanyu = new AdriftInTheHarbor();
      let hasGanyu = false;
      let hasSSR = false;

      // Infinite loop, we want to keep pulling until we discovered a Ganyu.
      while (true) {
        const roll = adriftGanyu.roll();
        results.push(roll);

        // Filter all the results by its five star.
        // If there are any results, store its name in a new array for easier checking.
        const filteredResults = roll.filter(item => item.rating === 5);
        const names = filteredResults.map(e => e.name);
        const areNamesFilled = names.length > 0;

        // This step will fail if the second SSR is not Ganyu.
        // We'll also have to check if we pulled any SSR, hence the 'names.length' to prevent false negatives.
        if (hasSSR && !names.includes('Ganyu') && areNamesFilled) {
          expect.fail('The second SSR pulled was not Ganyu!');
        }

        // If the first SSR is not Ganyu, set 'hasSSR' to true.
        if (!names.includes('Ganyu') && areNamesFilled) {
          hasSSR = true;
        }

        // The next SSR, we have to check if it is truly Ganyu.
        if (hasSSR && names.includes('Ganyu') && areNamesFilled) {
          hasGanyu = true;
          break;
        }

        // If the SSR is Ganyu, then exit.
        if (names.includes('Ganyu') && areNamesFilled) {
          hasGanyu = true;
          break;
        }
      }

      expect(hasGanyu).to.be.true;
      done();
    })
  })

  ////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////Beginners Wish////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  describe('Beginners Wish', () => {
    let firstResult = null
    let secondResult = null
    it('should return an instance of Beginners Wish', done => {
      beginners = new BeginnersWish()
      expect(beginners instanceof BeginnersWish).to.be.true
      done()
    })
    it('should give us Noelle as the first item', done => {
      firstResult = beginners.roll()
      const [item] = firstResult
      expect(item.name).to.be.equal('Noelle')
      done()
    })
    it('should give us 10 items', done => {
      expect(firstResult.length).to.be.equal(10)
      done()
    })
    it('should have counted 10 attempts', done => {
      expect(beginners.attemptsCount).to.be.equal(10)
      done()
    })
    it('should have a 4 or 5 star item on the second roll', done => {
      secondResult = beginners.roll()
      const item = secondResult.find(item => item.rating === 4 || item.rating === 5)
      expect(item.rating === 4 || item.rating === 5).to.be.true
      done()
    })
    it('should return null for the third roll', done => {
      const thirdResult = beginners.roll()
      expect(thirdResult).to.not.exist
      done()
    })
  })
  ////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////Testing Epitome Invocation/////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  describe('Epitome Invocation', () => {
    it('should return an instance of Epitome Invocation', done => {
      epitome = new EpitomeInvocation()
      expect(epitome instanceof EpitomeInvocation).to.be.true
      done()
    })
    it('should have a 4 or 5 star item', done => {
      const results = epitome.roll()
      const item = results.find(item => item.rating === 4 || item.rating === 5)
      expect(!!(item)).to.be.true
      done()
    })
    it('should register 10 attempts', done => {
      expect(epitome.attemptsCount).to.be.equal(10)
      done()
    })
    it('should give us a total of 10 items', done => {
      const results = epitome.roll()
      expect(results.length === 10).to.be.true
      done()
    })
    it('should have a guaranteed 5 star item', done => {
      for (let i = 0; i < 5; i++) {
        epitome.roll()
      }
      const results = epitome.roll()
      const item = results.find(item => item.rating === 5)
      expect(!!(item)).to.be.true
      done()
    })
    it('should register 80 attempts', done => {
      expect(epitome.attemptsCount).to.be.equal(80)
      done()
    })
    it('should have another guaranteed 5 star item', done => {
      for (let i = 0; i < 7; i++) {
        epitome.roll()
      }
      const results = epitome.roll()
      const item = results.find(item => item.rating === 5)
      expect(!!(item)).to.be.true
      done()
    })
    it('should register 160 attempts', done => {
      expect(epitome.attemptsCount).to.be.equal(160)
      done()
    })
  })
  ////////////////////////////////////////////////////////////////////////////////
  /////////////////////////Testing Wanderlust Invocation//////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  describe('Wanderlust Invocation', () => {
    it('should return an instance of Wanderlust Invocation', done => {
      wanderlust = new WanderlustInvocation()
      expect(wanderlust instanceof WanderlustInvocation).to.be.true
      done()
    })
    it('should have a 4 or 5 star item', done => {
      const results = wanderlust.roll()
      const item = results.find(item => item.rating === 4 || item.rating === 5)
      expect(!!(item)).to.be.true
      done()
    })
    it('should register 10 attempts', done => {
      expect(wanderlust.attemptsCount).to.be.equal(10)
      done()
    })
    it('should give us a total of 10 items', done => {
      const results = wanderlust.roll()
      expect(results.length === 10).to.be.true
      done()
    })
    it('should have a guaranteed 5 star item', done => {
      for (let i = 0; i < 6; i++) {
        wanderlust.roll()
      }
      const results = wanderlust.roll()
      const item = results.find(item => item.rating === 5)
      expect(!!(item)).to.be.true
      done()
    })
    it('should register 90 attempts', done => {
      expect(wanderlust.attemptsCount).to.be.equal(90)
      done()
    })
    it('should have another guaranteed 5 star item', done => {
      for (let i = 0; i < 8; i++) {
        wanderlust.roll()
      }
      const results = wanderlust.roll()
      const item = results.find(item => item.rating === 5)
      expect(!!(item)).to.be.true
      done()
    })
    it('should register 180 attempts', done => {
      expect(wanderlust.attemptsCount).to.be.equal(180)
      done()
    })
  })
})

describe('User can Wish x1', () => {
  it('Should pull 10 times and the 10th time should be a 4 star item', () => {
    const adrift = new AdriftInTheHarbor()
    const epitome = new EpitomeInvocation()
    const wanderlust = new WanderlustInvocation()
    for(let i = 0; i < 9; i++) {
      const itemAdrift = adrift.rollOnce()
      const itemEpitome = epitome.rollOnce()
      const itemWanderlust = wanderlust.rollOnce()
      expect(itemSchema.isValidSync(itemAdrift)).to.be.true
      expect(itemSchema.isValidSync(itemEpitome)).to.be.true
      expect(itemSchema.isValidSync(itemWanderlust)).to.be.true
    }
    const itemAdrift = adrift.rollOnce()
    const itemEpitome = epitome.rollOnce()
    const itemWanderlust = wanderlust.rollOnce()
    expect(itemSchema.isValidSync(itemAdrift)).to.be.true
    expect(itemSchema.isValidSync(itemEpitome)).to.be.true
    expect(itemSchema.isValidSync(itemWanderlust)).to.be.true
    expect(itemAdrift.rating === 4 || itemAdrift.rating === 5).to.be.true
    expect(itemEpitome.rating === 4 || itemEpitome.rating === 5).to.be.true
    expect(itemWanderlust.rating === 4 || itemWanderlust.rating === 5).to.be.true
  })
  it('Beginners wish should be blocked from doing 10 wishes', () => {
    let canUserWishFor10Items = true
    const disableUserCanWishFor10Items = () => {
      canUserWishFor10Items = false
    }
    let beginners = new BeginnersWish(() => {}, disableUserCanWishFor10Items)
    for(let i = 0; i < 11; i++) {
      const item = beginners.rollOnce()
      expect(itemSchema.isValidSync(item)).to.be.true
    }
    expect(canUserWishFor10Items).to.be.false
    const noItems = beginners.roll()
    expect(noItems).to.be.null
    for (let i = 0; i < 8; i++) {
      const item = beginners.rollOnce()
      expect(itemSchema.isValidSync(item)).to.be.true
    }
    const noItemsAgain = beginners.roll()
    expect(noItemsAgain).to.be.null
    const lastItem = beginners.rollOnce()
    expect(itemSchema.isValidSync(lastItem)).to.be.true
    const lastItemIsNull = beginners.rollOnce()
    expect(lastItemIsNull).to.be.null
  })
})
